import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Proforma } from '../proforma/proforma.entity'; // وارد کردن انتیتی پیش‌فاکتور برای ارتباط

// این انتیتی برای ذخیره اطلاعات فاکتور در دیتابیس استفاده می‌شود
@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number; // شناسه فاکتور

  @ManyToOne(() => Proforma, { eager: true })
  @JoinColumn({ name: 'proforma_id' })
  proforma: Proforma; // ارتباط با پیش‌فاکتور

  @Column()
  customerId: number; // شناسه مشتری

  @Column()
  date: Date; // تاریخ فاکتور

  @Column('decimal')
  totalAmount: number; // مجموع مبلغ فاکتور

  @Column()
  paymentStatus: string; // وضعیت پرداخت (مثال: Paid, Pending)

  // می‌توانید فیلدهای بیشتری برای ذخیره اطلاعات اضافه کنید
}
