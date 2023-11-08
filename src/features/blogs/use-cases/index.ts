import { CreateBlogPostCase } from './create-post.case';
import { UpdateBlogByIdCase } from './update-blog-by-id.case';
import { DeleteBlogByIdCase } from './delete-blog-by-id.case';
import { CreateBlogCase } from './create-blog.case';
import { DeleteBlogPostByIdCase } from './delete-post-by-id.case';
import { UpdateBlogPostByIdCase } from './udpate-post-by-id.case';

export const blogCases = [CreateBlogCase, CreateBlogPostCase, UpdateBlogByIdCase, UpdateBlogPostByIdCase, DeleteBlogByIdCase, DeleteBlogPostByIdCase];
