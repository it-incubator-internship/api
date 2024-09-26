import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import { Blogs, BlogDocument } from './blogs-schema';
import { Model } from 'mongoose';

import { FileDocument, Files } from '../schema/files.schema';

@Injectable()
export class FileRepository {
  constructor(@InjectModel(Files.name) private fileModel: Model<FileDocument>) {}

  async findAvatar({ userId }: { userId: string }) /*:*/ {
    const avatar = await this.fileModel.findOne({ userId }).exec();
    console.log('avatar in file repository:', avatar);

    return avatar;
  }

  async saveAvatar(avatar: Files) /*:*/ {
    const fileDocument: FileDocument = new this.fileModel(avatar);

    const avatarDto = await fileDocument.save();

    return avatarDto._id.toString();
  }

  // async deleteBlog(blogId: string) /*:*/ {
  //   if (!isValidObjectId(blogId)) {
  //     return null;
  //   }

  //   const result = await this.blogModel.deleteOne({ _id: new Types.ObjectId(blogId) });

  //   return result.deletedCount === 1;
  // }

  // async saveBlog(blog: Blogs) /*:*/ {
  //   const blogDocument: BlogDocument = new this.blogModel(blog);

  //   const blogDto = await blogDocument.save();

  //   return blogDto._id.toString();
  // }
}
