import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateOrderDto) {
    // 1) Calcular totales (en centavos para evitar errores de punto flotante)
    const totalCents = dto.items.reduce(
      (acc, it) => acc + Math.round(it.price * 100) * it.quantity,
      0,
    );
    const totalAmount = totalCents / 100;
    const itemsCount = dto.items.length; // nº de líneas del pedido
    const orderId = `ORD-${randomUUID()}`;
    const processedAt = new Date();

    // 2) Insertar en PostgreSQL (orders + order_items) en una sola transacción
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO orders (order_id, customer_id, total_amount, items_count, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, dto.customerId, totalAmount, itemsCount, processedAt],
      );

      // INSERT multi-fila: 1 sola ida a la BD para todos los items
      const values: (string | number)[] = [];
      const placeholders = dto.items.map((it, i) => {
        const o = i * 4;
        values.push(orderId, it.productId, it.quantity, it.price);
        return `($${o + 1}, $${o + 2}, $${o + 3}, $${o + 4})`;
      });
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ${placeholders.join(', ')}`,
        values,
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw new InternalServerErrorException('No se pudo registrar el pedido');
    } finally {
      client.release();
    }

    // 3) Respuesta
    return {
      orderId,
      customerId: dto.customerId,
      totalAmount,
      itemsCount,
      processedAt: processedAt.toISOString(),
    };
  }
}
