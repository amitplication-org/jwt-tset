import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { InjectRolesBuilder, RolesBuilder } from "nest-access-control";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AclFilterResponseInterceptor implements NestInterceptor {
  private static permissionCache = new Map<string, any>();

  constructor(
    @InjectRolesBuilder() private readonly rolesBuilder: RolesBuilder,
    private readonly reflector: Reflector
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const [permissionsRoles]: any = this.reflector.getAllAndMerge<string[]>(
      "roles",
      [context.getHandler(), context.getClass()]
    );

    const permissionKey = `${permissionsRoles.role}-${permissionsRoles.action}-${permissionsRoles.possession}-${permissionsRoles.resource}`;
    let permission =
      AclFilterResponseInterceptor.permissionCache.get(permissionKey);

    if (!permission) {
      permission = this.rolesBuilder.permission({
        role: permissionsRoles.role,
        action: permissionsRoles.action,
        possession: permissionsRoles.possession,
        resource: permissionsRoles.resource,
      });
      AclFilterResponseInterceptor.permissionCache.set(
        permissionKey,
        permission
      );
    }

    return next.handle().pipe(
      map((data) =>
        Array.isArray(data)
          ? data.map((item) => permission.filter(item))
          : permission.filter(data)
      ),
      catchError((err) => {
        console.error("Error in AclFilterResponseInterceptor:", err);
        return of(null);
      })
    );
  }
}
