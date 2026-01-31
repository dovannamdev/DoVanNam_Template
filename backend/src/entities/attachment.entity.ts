import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Message } from "./message.entity";

@Entity("attachments")
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  messageId: number;

  @Column({ length: 255 })
  filename: string;

  @Column({ length: 255 })
  originalName: string;

  @Column({ length: 100 })
  mimetype: string;

  @Column({ length: 500 })
  path: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Message, (message) => message.attachments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "messageId" })
  message: Message;
}
