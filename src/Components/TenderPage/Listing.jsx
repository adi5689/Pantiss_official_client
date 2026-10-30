import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  FileText,
  MapPin,
} from "lucide-react";
import { useContent } from "../../features/content/useContent";
import ContentState from "../../features/content/ContentState";
import { isOpen, displayDate } from "../../features/content/model";

const PREVIEW_LIMIT = 4;

const tabs = [
  { id: "open", label: "OPEN" },
  { id: "closed", label: "CLOSED" },
];

const renderTenderCard = (tender) => {
  const isOpen = tender.status === "open";

  return (
    <article
      key={tender.id}
      className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-red-950/5"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <FileText aria-hidden="true" size={21} />
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
            isOpen
              ? "bg-emerald-50 text-emerald-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>

      <h3 className="mb-6 text-xl font-semibold leading-snug text-gray-900">
        {tender.title}
      </h3>

      {tender.description && <p className="mb-5 text-sm leading-6 text-gray-600">{tender.description}</p>}
      <dl className="mt-auto space-y-3 border-t border-gray-100 pt-5 text-sm">
        <div className="flex items-center gap-3 text-gray-600">
          <CalendarDays className="shrink-0 text-gray-400" size={17} aria-hidden="true" />
          <dt className="sr-only">Start date</dt>
          <dd>Published {tender.startDate}</dd>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <CalendarDays className="shrink-0 text-gray-400" size={17} aria-hidden="true" />
          <dt className="sr-only">Deadline</dt>
          <dd>Deadline {tender.deadline}</dd>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <MapPin className="shrink-0 text-gray-400" size={17} aria-hidden="true" />
          <dt className="sr-only">Location</dt>
          <dd>{tender.location}</dd>
        </div>
      </dl>

      <a
        href={tender.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-red-600 hover:bg-red-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        aria-label={`View tender: ${tender.title}`}
      >
        View tender
        <ExternalLink size={16} aria-hidden="true" />
      </a>
    </article>
  );
};

const TendersListing = () => {
  const {records,loading,error,retry} = useContent('tenders');
  const tenders = records.map(t=>({...t,status:isOpen(t)?'open':'closed',startDate:displayDate(t.startDate),deadline:displayDate(t.deadline)}));
  const [activeTab, setActiveTab] = useState("open");
  const filteredTenders = tenders.filter(t=>t.status===activeTab);
  const visibleTenders = filteredTenders.slice(0, PREVIEW_LIMIT);

  const changeTab = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <section className="bg-gray-50 px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
              Procurement opportunities
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Tender notices
            </h2>
            <p className="mt-3 text-base leading-7 text-gray-600">
              Browse current opportunities or review previously closed tenders.
            </p>
          </div>

          <div
            className="inline-flex w-full rounded-xl border border-gray-200 bg-white p-1 shadow-sm sm:w-auto"
            role="group"
            aria-label="Tender status"
          >
            {tabs.map((tab) => {
              const count = tenders.filter(
                (tender) => tender.status === tab.id,
              ).length;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`${tab.id}-tab`}
                  aria-pressed={isActive}
                  aria-controls={`${tab.id}-panel`}
                  onClick={() => changeTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold tracking-wide transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:flex-none ${
                    isActive
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          id={`${activeTab}-panel`}
          role="region"
          aria-labelledby={`${activeTab}-tab`}
        >
          <ContentState loading={loading} error={error} retry={retry} />
          {loading || error ? null : visibleTenders.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {visibleTenders.map(renderTenderCard)}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <FileText size={24} aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                No {activeTab} tenders right now
              </h3>
              <p className="mt-2 max-w-md text-gray-600">
                New procurement opportunities will appear here when they are
                available.
              </p>
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Link
              to="/tenders/all"
              className="group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              View all tenders
              <ArrowRight
                className="transition-transform group-hover:translate-x-1"
                size={17}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TendersListing;
