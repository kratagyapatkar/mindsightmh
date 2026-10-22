<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All saved user data stays in browser localStorage via src/lib/store.ts; core practices remain offline. Optional AI guidance sends only the explicitly consented mood and optional note for processing, never journal/history/name, and does not persist request content on the app server.
- AI guidance uses a same-origin streaming TanStack HTTP route and server-only AI SDK Responses helpers; this keeps credentials private and allows cancellation and safe error delivery.
- Persist only operational AI access blocks in a service-role-only table, without user content; this prevents retrying terminal denials across server restarts.
- Store explicitly saved, completed AI suggestions inside their local mood entry with original mood context; this keeps history, export, and deletion together without sending saved content back to AI.
- Keep reminders as timestamps on local saved calming suggestions and surface due reminders only inside the app; this avoids external notifications, background services, and transmitting private content.
- Record reminder completion separately from dismissal on the local saved suggestion and reset completion on rescheduling; this makes history reflect explicit completion rather than merely opening or cancelling a reminder.
- Pin patched transitive security dependencies in package.json overrides when parent packages still allow vulnerable versions; this fixes advisories without unrelated framework upgrades.
- Generate complete phone backups as client-only ZIP snapshots, delivered through file sharing or download; browser sandbox limits require user-controlled extraction rather than automatic main-storage writes.
