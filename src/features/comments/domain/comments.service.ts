import { Injectable } from '@nestjs/common';
import { ICommentsService } from '../types/common';

@Injectable()
export class CommentsService implements ICommentsService {}
