import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateKnowledgeDto } from 'src/app/modules/knowledges/dtos/updateKnowledge.dto';
import { KnowledgeCategory } from 'src/app/modules/knowledges/knowledges.controller';

describe('UpdateKnowledgeDto', () => {
  const validEnumValues: KnowledgeCategory[] = [
    'product_feature',
    'pricing',
    'objection',
    'flow_step',
    'legal',
    'faq',
  ];

  it('should pass validation if all fields are valid', async () => {
    const dto = plainToInstance(UpdateKnowledgeDto, {
      title: 'Título válido',
      text: 'Texto válido',
      category: 'faq',
      metadata: { a: 1, b: 'test' },
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should allow empty object since all fields are optional', async () => {
    const dto = plainToInstance(UpdateKnowledgeDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  // ---------------------------
  // TITLE
  // ---------------------------
  it('should fail if title is not a string', async () => {
    const dto = plainToInstance(UpdateKnowledgeDto, {
      title: 123,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  // ---------------------------
  // TEXT
  // ---------------------------
  it('should fail if text is not a string', async () => {
    const dto = plainToInstance(UpdateKnowledgeDto, {
      text: 999,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  // ---------------------------
  // CATEGORY (ENUM)
  // ---------------------------
  it('should accept valid enum values for category', async () => {
    for (const value of validEnumValues) {
      const dto = plainToInstance(UpdateKnowledgeDto, { category: value });
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    }
  });

  it('should reject invalid enum value for category', async () => {
    const dto = plainToInstance(UpdateKnowledgeDto, {
      category: 'invalid_category',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  // ---------------------------
  // METADATA
  // ---------------------------
  it('should accept metadata as an object', async () => {
    const dto = plainToInstance(UpdateKnowledgeDto, {
      metadata: { x: 1 },
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if metadata is not an object', async () => {
    const dto = plainToInstance(UpdateKnowledgeDto, {
      metadata: 'abc',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
