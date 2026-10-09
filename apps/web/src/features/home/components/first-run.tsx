import { Link } from '@tanstack/react-router'
import { Button } from '@web/components/actions/button'
import { OwlKit } from '@web/components/brand/owl-kit'
import { OwlScene } from '@web/components/brand/owl-scene'
import { ProgressBar } from '@web/components/charts/progress-bar'
import { Badge } from '@web/components/display/badge'
import { Card } from '@web/components/display/card'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { homeMessages } from '@web/features/home/home.messages'
import type { FirstRunProps, StepRowProps } from '@web/features/home/home.types'
import { cn } from '@web/lib/cn'

const messages = homeMessages.firstRun
const FULL = 100
const OWL = 'w-40 shrink-0 self-center lg:order-last lg:w-56'
const PREVIEW = [
  { key: 'free', label: messages.preview.free, step: 4 },
  { key: 'income', label: messages.preview.income, step: 3 },
  { key: 'spent', label: messages.preview.spent, step: 4 },
  { key: 'committed', label: messages.preview.committed, step: 3 },
] as const

export function FirstRun({
  workspaceId,
  workspaceName,
  steps,
  canInvite,
  isJustCreated = false,
}: FirstRunProps) {
  const done = steps.filter((step) => step.isDone).length
  const next = steps.find((step) => !step.isDone)
  const link = (area: string) => <Link to="/w/$workspaceId/$area" params={{ workspaceId, area }} />
  return (
    <div
      data-slot="first-run"
      data-created={isJustCreated ? '' : undefined}
      className="flex flex-col gap-5"
    >
      <section
        data-first-run="hero"
        className="relative flex flex-col gap-4 overflow-hidden rounded-xl bg-mint p-5 text-on-mint lg:flex-row lg:items-center lg:p-8"
      >
        {isJustCreated ? (
          <OwlKit kit="space-created" scene="space" className={OWL} />
        ) : (
          <OwlScene scene="space" className={OWL} />
        )}
        <div className="flex flex-1 flex-col items-start gap-3">
          <p className="text-label">{messages.welcome(workspaceName)}</p>
          <h1 className="font-display text-title-lg lg:text-display">{messages.title}</h1>
          <p className="text-body">{messages.text}</p>
          <div className="flex w-full max-w-90 flex-col gap-1.5">
            <ProgressBar percent={(done / steps.length) * FULL} tone="onMint" />
            <p className="text-body-sm font-semibold">{messages.progress(done, steps.length)}</p>
          </div>
          {next && (
            <Button surface="mint" render={link(next.area)}>
              {messages.steps[next.key].start}
            </Button>
          )}
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-12">
        <Card
          className="lg:col-span-7"
          title={messages.stepsTitle}
          description={messages.stepsText}
        >
          <ol className="flex flex-col gap-2">
            {steps.map((step, position) => (
              <StepRow
                key={step.key}
                step={step}
                position={position + 1}
                isNext={step === next}
                action={link(step.area)}
              />
            ))}
          </ol>
        </Card>
        <Card
          className="lg:col-span-5"
          title={messages.previewTitle}
          description={messages.previewText}
        >
          <ul className="grid grid-cols-2 gap-2.5" aria-hidden="true">
            {PREVIEW.map((item) => (
              <li
                key={item.key}
                className="flex flex-col gap-1 rounded-md border border-dashed border-border p-3"
              >
                <span className="text-body-sm text-ink-muted">{item.label}</span>
                <span className="font-display text-title text-ink-subtle">
                  {messages.previewValue}
                </span>
                <span className="text-caption text-ink-muted">{messages.afterStep(item.step)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {canInvite && (
        <section className="flex flex-col items-start gap-2 rounded-lg border-2 border-dashed border-border bg-surface p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-title">{messages.invite.title}</h2>
            <p className="text-body-sm text-ink-muted">{messages.invite.text}</p>
          </div>
          <Button variant="outline" render={link('members')}>
            {messages.invite.action}
          </Button>
        </section>
      )}
    </div>
  )
}

function StepRow({ step, position, isNext, action }: StepRowProps) {
  const copy = messages.steps[step.key]
  return (
    <li
      data-first-run="step"
      aria-current={isNext ? 'step' : undefined}
      className={cn(
        'flex gap-3 rounded-md border px-3.5 py-3',
        isNext ? 'border-mint bg-mint-soft' : 'border-border',
      )}
    >
      <span
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-full text-label',
          step.isDone ? 'bg-success-soft' : 'bg-sunken',
        )}
      >
        {step.isDone ? <TwiseIcon name="ok" tone="success" size="sm" /> : position}
      </span>
      <div className="flex flex-1 flex-col items-start gap-1">
        <p className="flex flex-wrap items-center gap-2 text-body font-semibold">
          {copy.title}
          {isNext && (
            <span data-first-run="next" className="inline-flex">
              <Badge tone="success">{messages.next}</Badge>
            </span>
          )}
          {step.isDone && <span className="sr-only">{messages.done}</span>}
        </p>
        {!step.isDone && <p className="text-body-sm text-ink-muted">{copy.text}</p>}
        {isNext && (
          <Button size="sm" className="mt-1" render={action}>
            {copy.action}
          </Button>
        )}
      </div>
    </li>
  )
}
