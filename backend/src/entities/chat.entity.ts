import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Message } from "./message.entity";

@Entity("chats")
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, default: "New Chat" })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
