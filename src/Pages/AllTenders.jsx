import { useState } from "react";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useContent } from "../features/content/useContent";
import ContentState from "../features/content/ContentState";
import { isOpen, displayDate } from "../features/content/model";

const filters = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
];

const AllTenders = () => {
  const {records,loading,error,retry} = useContent('tenders');
  const tenders = records.map(t=>({...t,status:isOpen(t)?'open':'closed',startDate:displayDate(t.startDate),deadline:displayDate(t.deadline)}));
  const [activeFilter, setActiveFilter] = useState("all");
  const filteredTenders =
    activeFilter === "all"
      ? tenders
      : tenders.filter((tender) => tender.status === activeFilter);

  return (
    <main className="bg-neutral-50 px-4 py-10 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/tenders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-4"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to tenders
        </Link>

        <header className="mb-10 mt-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-600">
            Procurement
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
            All tender notices
          </h1>
          <p className="mt-5 text-lg leading-8 text-neutral-600">
            Review current procurement opportunities and browse previously closed Pantiss Foundation tenders.
          </p>
        </header>

        <section aria-labelledby="tender-table-heading">
          <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                Tender archive
              </p>
              <h2 id="tender-table-heading" className="mt-2 text-2xl font-semibold text-neutral-950 sm:text-3xl">
                Tender listings
              </h2>
            </div>

            <div
              role="group"
              aria-label="Filter tenders by status"
              className="inline-flex w-full rounded-xl border border-neutral-200 bg-white p-1 shadow-sm sm:w-auto"
            >
              {filters.map((filter) => {
                const isActive = activeFilter === filter.id;
                const count =
                  filter.id === "all"
                    ? tenders.length
                    : tenders.filter((tender) => tender.status === filter.id).length;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:flex-none ${
                      isActive
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                    }`}
                  >
                    {filter.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <ContentState loading={loading} error={error} retry={retry} />
          <div hidden={loading || Boolean(error)} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <caption className="sr-only">
                  Pantiss Foundation tender notices, including title, location, published date, deadline, status and notice link.
                </caption>
                <thead className="bg-neutral-950 text-white">
                  <tr>
                    <th scope="col" className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">Tender</th>
                    <th scope="col" className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">Location</th>
                    <th scope="col" className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">Published</th>
                    <th scope="col" className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">Deadline</th>
                    <th scope="col" className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider">Notice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredTenders.length > 0 ? (
                    filteredTenders.map((tender) => (
                      <tr key={tender.id} className="transition hover:bg-red-50/40">
                        <th scope="row" className="max-w-md px-5 py-5 text-sm font-semibold leading-6 text-neutral-950">
                          {tender.title}
                          {tender.description && <p className="mt-2 text-sm font-normal text-neutral-600">{tender.description}</p>}
                        </th>
                        <td className="whitespace-nowrap px-5 py-5 text-sm text-neutral-600">{tender.location}</td>
                        <td className="whitespace-nowrap px-5 py-5 text-sm text-neutral-600">{tender.startDate}</td>
                        <td className="whitespace-nowrap px-5 py-5 text-sm text-neutral-600">{tender.deadline}</td>
                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              tender.status === "open"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {tender.status === "open" ? "Open" : "Closed"}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-right">
                          <a
                            href={tender.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open tender notice: ${tender.title}`}
                            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-red-600 hover:bg-red-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                          >
                            View notice
                            <ExternalLink aria-hidden="true" className="h-4 w-4" />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-14 text-center">
                        <FileText aria-hidden="true" className="mx-auto h-8 w-8 text-neutral-400" />
                        <p className="mt-3 font-semibold text-neutral-800">
                          No {activeFilter} tenders right now
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          New opportunities will be listed here when available.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-4 text-sm text-neutral-500" aria-live="polite">
            Showing {filteredTenders.length} of {tenders.length} tenders.
          </p>
        </section>
      </div>
    </main>
  );
};

export default AllTenders;
