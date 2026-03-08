# complete the plan to choose what error handeling we continue with
inthec odebase

- https://gemini.google.com/app/e81b9985dab21f0e

## Result Pattern Implementation
- [ ] Implement `Result` pattern (discriminated unions) for API responses in the frontend.
- [ ] Migrate `apiFetch` in `src/react-app/api/client.ts` to return `Result<T, E>` instead of throwing.
- [ ] Ensure exhaustive error checking using `switch` cases on error types.
- [ ] Use `never` check in `default` case to force handling of all error types from the backend's source of truth.
- [ ] Synchronize error types between `src/lib/types/result.ts` and frontend handlers.