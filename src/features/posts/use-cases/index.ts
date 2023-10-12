import { CreatePostCommentByIdCase } from './create-post-comment-by-id.case';
import { CreatePostCase } from './create-post.case';
import { DeletePostByIdCase } from './delete-post-by-id.case';
import { UpdatePostByIdCase } from './udpate-post-by-id.case';
import { UpdatePostLikeStatusCase } from './update-post-like-status.case';

export const postCases = [CreatePostCommentByIdCase, CreatePostCase, DeletePostByIdCase, UpdatePostByIdCase, UpdatePostLikeStatusCase];
