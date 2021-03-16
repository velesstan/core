import { Role } from 'src/common/enums';
import { User } from 'src/common/interfaces';

export class UpdateUserDto implements User {
  role: Role;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}
