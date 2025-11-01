import { CreateBoardDto } from '../../../../src/app/modules/boards/dtos/createBoard.dto';

describe('CreateBoardDto', () => {
  it('debería crear una instancia correctamente', () => {
    const dto = new CreateBoardDto();
    dto.title = 'Proyecto CRM';
    dto.description = 'Tablero principal del equipo de ventas';
    dto.workspaceId = '550e8400-e29b-41d4-a716-446655440000';
    dto.color = '#3498db';
    dto.memberIds = [
      '64a1b2c3-d4e5-46a7-b8c9-d0e175f2e3d4',
      '75f2e3d4-a1b2-43e4-f5g6-h7i864a1b2c3',
    ];

    expect(dto).toBeInstanceOf(CreateBoardDto);
    expect(dto.title).toBe('Proyecto CRM');
    expect(dto.description).toBe('Tablero principal del equipo de ventas');
    expect(dto.workspaceId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(dto.color).toBe('#3498db');
    expect(dto.memberIds).toEqual([
      '64a1b2c3-d4e5-46a7-b8c9-d0e175f2e3d4',
      '75f2e3d4-a1b2-43e4-f5g6-h7i864a1b2c3',
    ]);
  });

  it('debería permitir que la descripción sea opcional', () => {
    const dto = new CreateBoardDto();
    dto.title = 'Proyecto sin descripción';
    dto.workspaceId = '550e8400-e29b-41d4-a716-446655440000';
    dto.color = '#ff5733';
    dto.memberIds = ['64a1b2c3-d4e5-46a7-b8c9-d0e175f2e3d4'];

    expect(dto.description).toBeUndefined();
    expect(dto.title).toBe('Proyecto sin descripción');
    expect(dto.memberIds).toEqual(['64a1b2c3-d4e5-46a7-b8c9-d0e175f2e3d4']);
  });

  it('debería tener las propiedades definidas correctamente', () => {
    const dto = new CreateBoardDto();
    const keys = Object.keys(dto);
    expect(keys).toEqual(expect.arrayContaining(['title', 'memberIds']));
  });

  it('debería asignar correctamente un arreglo de memberIds', () => {
    const dto = new CreateBoardDto();
    dto.memberIds = [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ];
    expect(Array.isArray(dto.memberIds)).toBe(true);
    expect(dto.memberIds.length).toBe(3);
  });
});
