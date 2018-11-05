import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
interface IUser extends mongoose.Document {
    email: String;
    password: String;
  };

export const UserSchema = new mongoose.Schema({
    email: {type:String, required: true, unique : true}, 
    password: {type:String, required: true},
});

UserSchema.pre('save', async function (next) {
    const hash = await bcrypt.hash((<any>this).password, 10);
    (<any>this).password = hash;
    next();
  });

  UserSchema.methods.isValidPassword = async (password,userPassword)=>{
    const compare = await bcrypt.compare(password, userPassword);
    return compare;
  }

export const UserModel = mongoose.model<IUser>('User', UserSchema);