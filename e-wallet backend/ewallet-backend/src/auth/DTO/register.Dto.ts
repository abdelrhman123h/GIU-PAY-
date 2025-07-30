export class RegisterDto {
  email: string;
  password: string;
  role: 'student' | 'staff' | 'food-court';
  staff?: string;
  foodCourt?: string;
}
