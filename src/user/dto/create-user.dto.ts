import { Role } from 'src/common/enums';
import { User } from 'src/common/interfaces';

export class CreateUserDto implements User {
  role: Role;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}
