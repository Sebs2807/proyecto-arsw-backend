import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QueryUserDto } from '../../../../src/app/modules/users/dtos/queryUser.dto';
import { Role } from '../../../../src/database/entities/userworkspace.entity';

describe('QueryUserDto', () => {
  it('debería crear una instancia válida con valores por defecto', async () => {
    const dto = plainToInstance(QueryUserDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    expect(dto.excludeWorkspaceMembers).toBe(true);
  });

  it('debería transformar excludeWorkspaceMembers correctamente', async () => {
    const cases = [
      { input: undefined, expected: true },
      { input: null, expected: true },
      { input: 'true', expected: true },
      { input: true, expected: true },
      { input: 'false', expected: false },
      { input: false, expected: false },
      { input: 'random', expected: true }, 
      { input: 0, expected: false },
      { input: 1, expected: true },
    ];

    for (const c of cases) {
      const dto = plainToInstance(QueryUserDto, {
        excludeWorkspaceMembers: c.input,
      });
      expect(dto.excludeWorkspaceMembers).toBe(c.expected);
    }
  });

  it('debería convertir page y limit a números usando class-transformer', () => {
    const dto = plainToInstance(QueryUserDto, {
      page: '5',
      limit: '20',
    });
    expect(dto.page).toBe(5);
    expect(dto.limit).toBe(20);
  });

  it('debería validar que page y limit sean >= 1', async () => {
    const dto = plainToInstance(QueryUserDto, {
      page: 0,
      limit: 0,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'page')).toBe(true);
    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });

  it('debería permitir valores válidos de Role', async () => {
    const dto = plainToInstance(QueryUserDto, {
      role: Role.MEMBER,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.role).toBe(Role.MEMBER);
  });

    it('debería validar correctamente workspaceId como UUID', async () => {
        const dtoValid = plainToInstance(QueryUserDto, {
            workspaceId: '123e4567-e89b-12d3-a456-426614174000',
        });

        const dtoInvalid = plainToInstance(QueryUserDto, {
            workspaceId: 'not-a-uuid',
        });

        const errorsValid = await validate(dtoValid);
        const errorsInvalid = await validate(dtoInvalid);

        expect(errorsValid.length).toBe(0);

        expect(errorsInvalid.length).toBeGreaterThan(0);
    });


  it('debería aceptar boardId y search como strings opcionales', async () => {
    const dto = plainToInstance(QueryUserDto, {
      search: 'john',
      boardId: 'b123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.search).toBe('john');
    expect(dto.boardId).toBe('b123');
  });
});
