import { Injectable } from '@nestjs/common';
import { IPostsService } from '../types/common';

@Injectable()
export class PostsService implements IPostsService {}
