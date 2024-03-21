import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { QuizGameQuestionsEntity } from './quiz-game-questions.entity';

@EventSubscriber()
export class QuizGameQuestionsSubscriber implements EntitySubscriberInterface<QuizGameQuestionsEntity> {
  listenTo() {
    return QuizGameQuestionsEntity;
  }

  /**
   * Called before entity insertion.
   */
  beforeInsert(event: InsertEvent<any>) {
    // console.log(`BEFORE ENTITY INSERTED: `, event.entity);
  }

  /**
   * Called after entity insertion.
   */
  afterInsert(event: InsertEvent<any>) {
    // console.log(`AFTER ENTITY INSERTED: `, event.entity);
  }

  /**
   * Called before entity update.
   */
  beforeUpdate(event: UpdateEvent<any>) {
    // console.log(`BEFORE ENTITY UPDATED: `, event.entity);
  }

  /**
   * Called after entity update.
   */
  afterUpdate(event: UpdateEvent<any>) {
    // console.log(`AFTER ENTITY UPDATED: `, event.entity);
  }
}
