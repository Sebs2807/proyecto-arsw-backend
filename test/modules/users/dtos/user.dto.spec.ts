// import { validate } from 'class-validator';
// import { UserDto } from 'src/app/modules/users/dtos/user.dto';

// describe('UserDto', () => {
//   it('debería ser válido con datos correctos', async () => {
//     const user = new UserDto();
//     user.firstName = 'John';
//     user.lastName = 'Doe';
//     user.email = 'john.doe@example.com';
//     user.picture = 'https://example.com/avatar.jpg';
//     user.JWTRefreshToken = 'token123';

//     const errors = await validate(user);
//     expect(errors.length).toBe(0);
//   });

//   it('debería fallar si el email no es válido', async () => {
//     const user = new UserDto();
//     user.firstName = 'John';
//     user.lastName = 'Doe';
//     user.email = 'correo-no-valido';

//     const errors = await validate(user);
//     expect(errors.length).toBeGreaterThan(0);
//     expect(errors[0].property).toBe('email');
//   });

//   it('debería permitir que picture y JWTRefreshToken sean opcionales', async () => {
//     const user = new UserDto();
//     user.firstName = 'Jane';
//     user.lastName = 'Smith';
//     user.email = 'jane@example.com';

//     const errors = await validate(user);
//     expect(errors.length).toBe(0);
//   });

//   it('debería fallar si falta un campo obligatorio', async () => {
//     const user = new UserDto();
//     user.email = 'john@example.com';

//     const errors = await validate(user);
//     const fieldsWithErrors = errors.map((e) => e.property);
//     expect(fieldsWithErrors).toContain('firstName');
//     expect(fieldsWithErrors).toContain('lastName');
//   });
// });
