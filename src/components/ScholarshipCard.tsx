import type { ScholarshipWithCountry } from '../types/scholarship';
import {
  deadlineStatus,
  effectiveTags,
  tagLabel,
  TAG_META,
  searchText,
  icsHref,
} from '../lib/scholarship';

interface Props {
  item: ScholarshipWithCountry;
  /** index used only for a subtle staggered entrance */
  index?: number;
}

/** A small clickable citation chip that links straight to the source. */
function Cite({ n, url, label }: { n: number; url: string; label: string }) {
  return (
    <a
      className="cite"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Source ${n}: ${label} — ${url}`}
      aria-label={`Source ${n}: ${label} (opens in a new tab)`}
    >
      {n}
    </a>
  );
}

export default function ScholarshipCard({ item, index = 0 }: Props) {
  const status = deadlineStatus(item);
  const tags = effectiveTags(item, status);
  const sources = item.sources ?? [];

  // Map a source URL to its 1-based index for inline citation chips.
  const srcIndex = (url?: string) => {
    if (!url) return -1;
    const i = sources.findIndex((s) => s.url === url);
    return i >= 0 ? i + 1 : -1;
  };

  const ar = item.acceptanceRate;
  const arSrcN = srcIndex(ar.source);
  const ics = icsHref(item, status);

  // Recommended fields present on this entry (progressive disclosure).
  const rec: Array<[string, React.ReactNode]> = [];
  const push = (k: string, v?: React.ReactNode) => {
    if (v !== undefined && v !== null && v !== '') rec.push([k, v]);
  };
  push('Degree type', item.degreeType);
  push('Duration', item.duration);
  push('Intake', item.intake?.join(', '));
  push('Eligible nationalities', item.eligibleNationalities);
  push('Language', item.languageRequirements);
  push('Standardized tests', item.standardizedTests);
  push('Min GPA', item.minGPA);
  push('Age limit', item.ageLimit);
  push('Application fee', item.applicationFee);
  push('Monthly stipend', item.monthlyStipend);
  if (item.fundingCovers?.length)
    push('Funding covers', <span>{item.fundingCovers.join(' · ')}</span>);
  if (item.supervisorRequired !== undefined)
    push('Supervisor first', item.supervisorRequired ? 'Required before applying' : 'Not required');
  if (item.twoStepProcess !== undefined)
    push('Two-step process', item.twoStepProcess ? 'Yes — admission, then scholarship' : 'No');
  push('Bond / service', item.bondObligation);
  if (item.coversDependents !== undefined)
    push('Covers dependents', item.coversDependents ? 'Yes' : 'No');
  if (item.interviewStage !== undefined)
    push('Interview stage', item.interviewStage ? 'Yes' : 'No');
  push('Renewal', item.renewalConditions);
  push('Post-study work', item.postStudyWork);

  const hostLine = [item.host?.city, item.host?.country].filter(Boolean).join(', ');

  return (
    <article
      className="card"
      data-scholarship
      data-country={item.countryKey}
      data-country-label={item.countryLabel}
      data-status={status.key}
      data-month={status.month ?? ''}
      data-tags={tags.join(' ')}
      data-name={item.name.toLowerCase()}
      data-deadline-ts={status.deadlineTs ?? ''}
      data-search={searchText(item)}
      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
    >
      <div className="card__top">
        <div>
          <div className="card__country">{item.countryLabel}</div>
          <h3 className="card__title">{item.name}</h3>
          {(hostLine || item.host?.universities?.length) && (
            <div className="card__host">
              {hostLine}
              {item.host?.universities?.length ? (
                <>
                  {hostLine ? ' · ' : ''}
                  {item.host.universities.slice(0, 3).join(', ')}
                  {item.host.universities.length > 3 ? ' …' : ''}
                </>
              ) : null}
            </div>
          )}
        </div>
        <span className="status" data-status={status.key}>{status.label}</span>
      </div>

      {/* Deadline (required field 2) */}
      <div className="card__deadline">
        <div>
          <div className="dl-label">Deadline · {item.timeline.cycle}</div>
          <div className="dl-date">{item.timeline.deadline}</div>
        </div>
        {ics && (status.key === 'open' || status.key === 'closing-soon' || status.key === 'opens-soon') && (
          <a className="btn btn--sm" href={ics} download={`${item.countryKey}-deadline.ics`} title="Add deadline to your calendar">
            + Calendar
          </a>
        )}
      </div>

      {/* Benefits (required field 3) */}
      <div className="kv">
        <div className="kv__row">
          <span className="kv__k">Benefits</span>
          <span className="kv__v">
            <ul>{item.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul>
          </span>
        </div>

        {/* Acceptance rate (required field 4) */}
        <div className="kv__row">
          <span className="kv__k">Acceptance</span>
          <span className="kv__v">
            <span className="acc-rate">
              <span>{ar.value}</span>
              {ar.isOfficial ? <span className="official">official</span> : <span className="unofficial">not official</span>}
              {arSrcN > 0 && <Cite n={arSrcN} url={ar.source!} label={sources[arSrcN - 1].label} />}
            </span>
            {ar.estimateNote && <div className="faint" style={{ fontSize: '0.78rem' }}>{ar.estimateNote}</div>}
          </span>
        </div>

        {/* Key documents (required field 1) */}
        <div className="kv__row">
          <span className="kv__k">Documents</span>
          <span className="kv__v">
            <ul>{item.requiredDocuments.map((d, i) => <li key={i}>{d}</li>)}</ul>
          </span>
        </div>

        {/* Must-know (required field 5) */}
        <div className="kv__row">
          <span className="kv__k">Must know</span>
          <span className="kv__v">
            <ul>{item.mustKnow.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </span>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="tag-row">
          {tags.map((t) => (
            <span key={t} className={'tag' + (TAG_META[t] ? ' tag--accent' : '')} title={TAG_META[t]?.hint}>
              {tagLabel(t)}
            </span>
          ))}
        </div>
      )}

      {/* Source citations — every source as a small clickable chip */}
      {sources.length > 0 && (
        <div className="src-chips">
          <span className="src-chips__label">Sources</span>
          {sources.map((s, i) => (
            <Cite key={i} n={i + 1} url={s.url} label={s.label} />
          ))}
        </div>
      )}

      {/* Official link (required field 0) */}
      <div className="card__foot">
        <a className="btn btn--primary" href={item.officialLink} target="_blank" rel="noopener noreferrer">
          Official page ↗
        </a>
        <span className="verified">Verified {item.lastVerified}</span>
      </div>

      {/* Progressive disclosure: recommended fields + full sources */}
      {(rec.length > 0 || sources.length > 0) && (
        <details className="disclose">
          <summary>
            <span className="chev" aria-hidden="true">›</span>
            More details &amp; {sources.length} source{sources.length === 1 ? '' : 's'}
          </summary>
          <div className="disclose__body">
            {rec.length > 0 && (
              <div className="kv">
                {rec.map(([k, v], i) => (
                  <div className="kv__row" key={i}>
                    <span className="kv__k">{k}</span>
                    <span className="kv__v">{v}</span>
                  </div>
                ))}
              </div>
            )}
            {sources.length > 0 && (
              <div>
                <div className="eyebrow" style={{ marginBottom: '0.4rem' }}>Sources</div>
                <ol className="src-list">
                  {sources.map((s, i) => (
                    <li key={i}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>{' '}
                      <span className="accessed">· accessed {s.accessed}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </details>
      )}
    </article>
  );
}
