import {
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { ConversationService } from 'src/conversation/conversation.service';
import { User, UserDocument } from 'src/schemas/user.schema';
import { CreateUserDtoType } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => ConversationService))
    private conversationService: ConversationService,
  ) {}

  async create(userData: CreateUserDtoType): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new this.userModel({
        ...userData,
        password: hashedPassword,
      });
      await user.save();

      const userObject = user.toObject();
      delete userObject.password;
      delete userObject.__v;
      return userObject;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findBy_id(_id: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ _id });
    const userObject: any = user.toObject();
    delete userObject.password;
    delete userObject.__v;
    delete userObject.cep;
    delete userObject.address;
    delete userObject.city;
    delete userObject.createdAt;
    delete userObject.updatedAt;
    delete userObject.userId;
    return userObject;
  }

  async findOne(userId: string): Promise<User | undefined> {
    return this.userModel.findOne({ userId });
  }

  async findMe(_id: string): Promise<User | undefined> {
    try {
      const user = await this.userModel.findOne({ _id });
      const objectUser = user.toObject();
      delete objectUser.password;
      delete objectUser.__v;
      return objectUser;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUsersToBeginConversation(userId: string): Promise<User[]> {
    const conversations = await this.conversationService.findByUserId(userId);
    const conversationUserIds = conversations
      .map((conversation) => conversation.participants)
      .flat()
      .map((participant: any) => new Types.ObjectId(participant.id));
    const users = await this.userModel.find({
      _id: { $nin: [...conversationUserIds, new Types.ObjectId(userId)] },
    });

    if (!users) return [];

    const usersObject = users.map((user: any) => {
      const userObject = user.toObject();
      delete userObject.password;
      delete userObject.__v;
      delete userObject.cep;
      delete userObject.address;
      delete userObject.city;
      delete userObject.createdAt;
      delete userObject.updatedAt;
      delete userObject.userId;
      return userObject;
    });

    return usersObject;
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email });
  }
}
