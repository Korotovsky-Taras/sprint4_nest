import { CreateBlogPostCase } from './create-post.case';
import { UpdateBlogByIdCase } from './update-blog-by-id.case';
import { DeleteBlogByIdCase } from './delete-blog-by-id.case';
import { CreateBlogCase } from './create-blog.case';

export const blogCases = [CreateBlogCase, CreateBlogPostCase, UpdateBlogByIdCase, DeleteBlogByIdCase];
