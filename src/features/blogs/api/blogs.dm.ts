import { withExternalDirection, withExternalNumber, withExternalString, withExternalTerm } from '../../../utils/withExternalQuery';
import { BlogPaginationQueryDto, BlogPaginationRepositoryDto, BlogViewDto } from '../types/dto';
import { BlogMongoType } from '../types/dao';
import { toIsoString } from '../../../utils/date';

const initialQuery: BlogPaginationRepositoryDto = {
  sortBy: 'createdAt',
  searchNameTerm: null,
  sortDirection: 'desc',
  pageNumber: 1,
  pageSize: 10,
};

export class BlogsDataMapper {
  constructor() {}

  static toBlogsView(items: BlogMongoType[]): BlogViewDto[] {
    return items.map((item) => {
      return BlogsDataMapper.toBlogView(item);
    });
  }

  static toBlogView(item: BlogMongoType): BlogViewDto {
    return {
      id: item._id.toString(),
      name: item.name,
      description: item.description,
      websiteUrl: item.websiteUrl,
      createdAt: toIsoString(item.createdAt),
      isMembership: item.isMembership,
    };
  }

  static toRepoQuery(query: BlogPaginationQueryDto): BlogPaginationRepositoryDto {
    return {
      sortBy: withExternalString(initialQuery.sortBy, query.sortBy),
      searchNameTerm: withExternalTerm(initialQuery.searchNameTerm, query.searchNameTerm),
      sortDirection: withExternalDirection(initialQuery.sortDirection, query.sortDirection),
      pageNumber: withExternalNumber(initialQuery.pageNumber, query.pageNumber),
      pageSize: withExternalNumber(initialQuery.pageSize, query.pageSize),
    };
  }
}
