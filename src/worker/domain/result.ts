import { Result, ResultAsync } from "neverthrow";
import type { DomainError } from "./errors";

export type DomainResult<T> = Result<T, DomainError>;
export type DomainResultAsync<T> = ResultAsync<T, DomainError>;
