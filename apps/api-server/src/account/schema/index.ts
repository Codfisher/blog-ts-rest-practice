import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ACCOUNT_ROLE, AccountRole } from '@project-code/shared'
import { HydratedDocument } from 'mongoose'

@Schema({
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Account {
  /** mongoose 原有的 id，但原本是 optional，這裡改為 required */
  id!: string

  @Prop({ type: String, enum: ACCOUNT_ROLE })
  role: AccountRole = ACCOUNT_ROLE.BASIC

  @Prop({ unique: true })
  username: string = ''

  @Prop()
  description: string = ''

  @Prop({ select: false })
  password: string = ''

  @Prop()
  name: string = ''

  /** 用於單次登入，沒有單次登入需求可以刪除 */
  @Prop({ select: false })
  refreshToken: string = ''
}
export type AccountDocument = HydratedDocument<Account>
export const AccountSchema = SchemaFactory.createForClass(Account)
