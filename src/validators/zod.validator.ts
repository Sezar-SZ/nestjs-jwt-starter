import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { Schema } from "zod";
import { fromZodError } from "zod-validation-error";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: Schema) {}

    async transform(value: any) {
        const res = await this.schema.safeParseAsync(value);
        if ("error" in res) {
            throw new BadRequestException("Validation failed", {
                description: `${fromZodError(res.error)}`,
            });
        }
        return value;
    }
}
