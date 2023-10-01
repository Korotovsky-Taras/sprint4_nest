import { validateOrReject } from 'class-validator';

export async function validateOrRejectDto(model: any, ctor: { new (): any }) {
  const isClassInstance = model instanceof ctor;
  if (!isClassInstance) {
    throw new Error('Validation dto: incorrect input data');
  }
  try {
    await validateOrReject(model);
  } catch (err) {
    throw new Error(err);
  }
}
