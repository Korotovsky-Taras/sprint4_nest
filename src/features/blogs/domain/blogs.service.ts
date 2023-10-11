import { Injectable } from '@nestjs/common';
import { IBlogService } from '../types/common';

@Injectable()
export class BlogsService implements IBlogService {}
