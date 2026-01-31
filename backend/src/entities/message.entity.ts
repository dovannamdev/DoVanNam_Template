import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Chat } from "./chat.entity";
import { Attachment } from "./attachment.entity";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chatId: number;

  @Column({ type: "enum", enum: ["user", "assistant"] })
  role: "user" | "assistant";

  @Column({ type: "text" })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: "CASCADE" })
  @JoinColumn({ name: "chatId" })
  chat: Chat;

  @OneToMany(() => Attachment, (attachment) => attachment.message)
  attachments: Attachment[];
}
