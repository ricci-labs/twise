import { Link } from '@tanstack/react-router'
import calendar from '@web/assets/illustrations/calendar.svg'
import card from '@web/assets/illustrations/card.svg'
import receipt from '@web/assets/illustrations/receipt.svg'
import together from '@web/assets/illustrations/together.svg'
import wallet from '@web/assets/illustrations/wallet.svg'
import { Button } from '@web/components/actions/button'
import { OwlKit } from '@web/components/brand/owl-kit'
import { OwlScene } from '@web/components/brand/owl-scene'
import { ProgressBar } from '@web/components/charts/progress-bar'
import { Card } from '@web/components/display/card'
import { ResponsiveText } from '@web/components/display/responsive-text'
import { TwiseIcon } from '@web/components/icons/twise-icon'
import { homeMessages } from '@web/features/home/home.messages'
import type {
  FirstRunProps,
  GhostTileProps,
  SetupStepKey,
  StepRowProps,
  UnlocksProps,
} from '@web/features/home/home.types'
import { cn } from '@web/lib/cn'
import { ChevronRight, Lock } from 'lucide-react'

const messages = homeMessages.firstRun
const FULL = 100
const START_PERCENT = 4
const OWL =
  'pointer-events-none absolute -top-2.5 -right-6.5 size-35 lg:static lg:order-last lg:-my-10 lg:-mr-5 lg:size-85 lg:shrink-0'
const ILLUSTRATIONS: Readonly<Record<SetupStepKey, string>> = {
  accounts: wallet,
  cards: card,
  income: calendar,
  entries: receipt,
}
const PREVIEW = [
  { key: 'free', step: 4 },
  { key: 'income', step: 3 },
  { key: 'spent', step: 4 },
  { key: 'committed', step: 3 },
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
        className="relative overflow-hidden rounded-xl bg-mint px-5 pt-5 pb-5.5 text-on-mint lg:flex lg:min-h-75 lg:items-center lg:gap-8 lg:px-11 lg:py-10"
      >
        {isJustCreated ? (
          <OwlKit kit="space-created" scene="space" className={OWL} />
        ) : (
          <OwlScene scene="space" className={OWL} />
        )}
        <div className="relative flex min-w-0 flex-1 flex-col items-start">
          <p className="mb-1.5 max-w-47.5 text-label lg:max-w-none">
            {messages.welcome(workspaceName)}
          </p>
          <h1 className="max-w-54 font-display text-title-lg lg:max-w-none lg:text-screen-title-lg">
            {messages.title}
          </h1>
          <p className="mt-3 max-w-125 text-body lg:text-claim-support">
            <ResponsiveText short={messages.textShort} long={messages.text} />
          </p>
          <div className="mt-4 flex w-full items-center gap-3 lg:mt-5.5 lg:w-auto">
            <ProgressBar
              percent={Math.max((done / steps.length) * FULL, START_PERCENT)}
              tone="onMint"
              className="w-0 flex-1 lg:w-65 lg:flex-none"
            />
            <span className="text-label whitespace-nowrap">
              <ResponsiveText
                short={messages.progressShort(done, steps.length)}
                long={messages.progress(done, steps.length)}
              />
            </span>
          </div>
          {next && (
            <Button className="mt-4 w-full lg:mt-6 lg:w-auto" render={link(next.area)}>
              {messages.steps[next.key].start}
              <ChevronRight aria-hidden="true" />
            </Button>
          )}
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-12">
        <Card
          className="lg:col-span-7"
          title={messages.stepsTitle}
          description={<ResponsiveText short={messages.stepsTextShort} long={messages.stepsText} />}
        >
          <ol className="flex flex-col">
            {steps.map((step, position) => (
              <StepRow
                key={step.key}
                step={step}
                position={position + 1}
                isNext={step === next}
                hasDivider={position > 0 && steps[position - 1] !== next && step !== next}
                workspaceId={workspaceId}
              />
            ))}
          </ol>
        </Card>
        <Card
          className={cn('lg:col-span-5', canInvite && 'lg:row-span-2')}
          title={messages.previewTitle}
          description={
            <ResponsiveText short={messages.previewTextShort} long={messages.previewText} />
          }
        >
          <div className="flex flex-1 flex-col gap-2.5" aria-hidden="true">
            <ul className="grid grid-cols-2 gap-2.5">
              {PREVIEW.map((item) => (
                <GhostTile
                  key={item.key}
                  label={
                    <ResponsiveText
                      short={messages.previewShort[item.key]}
                      long={messages.preview[item.key]}
                    />
                  }
                  unlock={
                    <ResponsiveText
                      short={messages.stepShort(item.step)}
                      long={messages.afterStep(item.step)}
                    />
                  }
                />
              ))}
            </ul>
            <div className="hidden flex-1 flex-col justify-between gap-1.5 rounded-md border border-dashed border-border-control px-3.5 py-3 lg:flex">
              <span className="text-label text-ink-muted">{messages.preview.forecast}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 380 92"
                preserveAspectRatio="none"
                className="my-2 min-h-23 w-full flex-1"
              >
                <path
                  d="M0 34 L60 34 L60 46 L120 46 L120 62 L190 62 L190 78 L210 78 L210 22 L270 22 L270 48 L330 48 L330 60 L380 60"
                  fill="none"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  vectorEffect="non-scaling-stroke"
                  className="stroke-border-control"
                />
                <line
                  x1="0"
                  x2="380"
                  y1="86"
                  y2="86"
                  vectorEffect="non-scaling-stroke"
                  className="stroke-border"
                />
              </svg>
              <Unlocks>{messages.afterSteps(1, 3)}</Unlocks>
            </div>
          </div>
        </Card>
        {canInvite && (
          <section className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3.5 outline-2 outline-offset-3 outline-warning-fill outline-dashed lg:col-span-7 lg:gap-3.5 lg:p-5">
            <img
              src={together}
              alt=""
              className="size-12 shrink-0 rounded-full bg-sketch-paper lg:size-14"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h2 className="text-title-sm">{messages.invite.title}</h2>
              <p className="text-body-sm text-ink-muted">{messages.invite.text}</p>
            </div>
            <Button variant="secondary" size="sm" render={link('members')}>
              {messages.invite.action}
            </Button>
          </section>
        )}
      </div>
    </div>
  )
}

function StepRow({ step, position, isNext, hasDivider, workspaceId }: StepRowProps) {
  const params = { workspaceId, area: step.area }
  const copy = messages.steps[step.key]
  const body = (
    <>
      <span
        className={cn(
          'grid size-6 shrink-0 place-items-center rounded-full border-2 text-caption font-bold lg:size-7',
          isNext && 'mt-2.5 border-ink bg-ink text-surface lg:mt-3',
          !isNext && step.isDone && 'border-success-soft bg-success-soft',
          !isNext && !step.isDone && 'border-border-control text-ink-muted',
        )}
      >
        {step.isDone ? <TwiseIcon name="ok" tone="success" size="sm" /> : position}
      </span>
      <img
        src={ILLUSTRATIONS[step.key]}
        alt=""
        className="size-11 shrink-0 rounded-full bg-sketch-paper lg:size-13"
      />
      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-body-sm text-ink-muted">
        <span className="flex flex-col-reverse items-start gap-0.5 text-title-sm text-ink lg:flex-row lg:items-center lg:gap-2">
          {copy.title}
          {isNext && (
            <span
              data-first-run="next"
              className="rounded-full bg-surface px-2 py-0.5 text-caption font-semibold whitespace-nowrap text-mint-ink"
            >
              {messages.next}
            </span>
          )}
          {step.isDone && <span className="sr-only">{messages.done}</span>}
        </span>
        {!step.isDone && <ResponsiveText short={copy.textShort} long={copy.text} />}
        {isNext && (
          <Button
            size="sm"
            className="mt-2.5"
            render={<Link to="/w/$workspaceId/$area" params={params} />}
          >
            {copy.action}
            <ChevronRight aria-hidden="true" />
          </Button>
        )}
      </span>
    </>
  )
  const row = cn(
    'flex gap-2.5 px-2 py-3 lg:gap-3.5 lg:px-3 lg:py-3.5',
    hasDivider && 'border-t border-border',
  )
  if (isNext) {
    return (
      <li
        data-first-run="step"
        aria-current="step"
        className={cn(row, 'items-start rounded-md bg-mint-soft')}
      >
        {body}
      </li>
    )
  }
  return (
    <li data-first-run="step" className="flex flex-col">
      <Link
        to="/w/$workspaceId/$area"
        params={params}
        className={cn(
          row,
          'items-center rounded-md hover:bg-page focus-visible:ring-2 focus-visible:ring-focus-ring',
        )}
      >
        {body}
        <ChevronRight className="size-5 shrink-0 text-ink-subtle" aria-hidden="true" />
      </Link>
    </li>
  )
}

function GhostTile({ label, unlock }: GhostTileProps) {
  return (
    <li className="flex flex-col gap-0.5 rounded-md border border-dashed border-border-control px-3 py-2.5 lg:px-3.5 lg:py-3">
      <span className="text-label text-ink-muted">{label}</span>
      <span className="font-display text-title text-ink-subtle lg:text-title-lg">
        {messages.previewValue}
      </span>
      <Unlocks>{unlock}</Unlocks>
    </li>
  )
}

function Unlocks({ children }: UnlocksProps) {
  return (
    <small className="inline-flex items-center gap-1.5 text-caption text-ink-subtle">
      <Lock className="size-3.5" aria-hidden="true" />
      {children}
    </small>
  )
}
