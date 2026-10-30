/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useContent } from "../../features/content/useContent";
import ContentState from "../../features/content/ContentState";
import { isOpen, displayDate } from "../../features/content/model";
import Heading from "../Common/Heading";
import { useLocation } from "react-router-dom";
import { ArrowUpRight, BriefcaseBusiness, ChevronLeft, Clock3, MapPin, SearchX, WalletCards } from "lucide-react";
const JobCard = ({
  job,
  onClick
}) => {
  return <button type="button" className="group flex h-full w-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:p-6" onClick={onClick}>
      <div className="flex w-full items-start justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
            {job.category}
          </span>
          <h3 className="mt-4 text-xl font-semibold leading-snug text-neutral-950 transition group-hover:text-red-700">
            {job.title}
          </h3>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition group-hover:border-red-600 group-hover:bg-red-600 group-hover:text-white">
          <ArrowUpRight aria-hidden="true" size={19} />
        </span>
      </div>

      {job.description?.[0] && <p className="mt-4 line-clamp-2 text-sm leading-6 text-neutral-600">
          {job.description[0]}
        </p>}

      <div className="mt-6 grid gap-3 border-t border-neutral-100 pt-4 text-sm text-neutral-600 sm:grid-cols-2">
        <span className="flex items-center gap-2">
          <MapPin aria-hidden="true" className="text-red-600" size={17} />
          {job.location}
        </span>
        <span className="flex items-center gap-2">
          <Clock3 aria-hidden="true" className="text-red-600" size={17} />
          {job.type}
        </span>
        <span className="flex items-center gap-2 sm:col-span-2">
          <WalletCards aria-hidden="true" className="text-red-600" size={17} />
          {job.salaryRange}
        </span>
      </div>
    </button>;
};
const DetailList = ({
  title,
  items
}) => {
  if (!items?.length) return null;
  return <section>
      <h4 className="text-lg font-semibold text-neutral-950">{title}</h4>
      <ul className="mt-3 space-y-2.5 text-neutral-700">
        {items.map(point => <li key={point} className="flex gap-3 leading-7">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
            <span>{point}</span>
          </li>)}
      </ul>
    </section>;
};
const JobDetails = ({
  job,
  onApply,
  onBack
}) => {
  return <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-neutral-200/60">
      <header className="border-b border-neutral-200 bg-neutral-950 px-6 py-8 text-white sm:px-10 sm:py-10">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <ChevronLeft aria-hidden="true" size={18} />
          Back to all roles
        </button>
        <span className="mt-8 inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-semibold">
          {job.category}
        </span>
        <h3 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
          {job.title}
        </h3>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-300">
          <span className="flex items-center gap-2">
            <MapPin aria-hidden="true" size={17} /> {job.location}
          </span>
          <span className="flex items-center gap-2">
            <Clock3 aria-hidden="true" size={17} /> {job.type}
          </span>
          <span className="flex items-center gap-2">
            <WalletCards aria-hidden="true" size={17} /> {job.salaryRange}
          </span>
        </div>
      </header>

      <div className="grid gap-10 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-9">
          <DetailList title="Role overview" items={job.description} />
          <DetailList title="Qualifications" items={job.qualifications} />
          <DetailList title="Experience" items={job.experience} />
          <DetailList title="Skills" items={job.skills} />
          <DetailList title="Benefits" items={job.benefits} />
          <DetailList title="Contact" items={job.contact} />
          {job.document && <a className="underline" href={job.document} target="_blank" rel="noopener noreferrer">Download job description</a>}
          {job.deadline && <p>Apply by {displayDate(job.deadline)}</p>}
        </div>

        <aside className="h-fit rounded-2xl border border-red-100 bg-red-50 p-5 lg:sticky lg:top-24">
          <h4 className="font-semibold text-neutral-950">Interested in this role?</h4>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Review the requirements, then submit your application through the
            official application link.
          </p>
          <button type="button" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2" onClick={onApply}>
            Apply now
            <ArrowUpRight aria-hidden="true" size={18} />
          </button>
          {job.applyNote?.[0] && <p className="mt-4 text-xs leading-5 text-neutral-500">
              {job.applyNote[0]}
            </p>}
        </aside>
      </div>
    </article>;
};
const JobsListing = () => {
  const location = useLocation();
  const {
    records,
    loading,
    error,
    retry
  } = useContent('jobs');
  const openJobs = records.filter(job => isOpen(job)).map(job => ({
    ...job,
    ...Object.fromEntries(['description', 'qualifications', 'experience', 'skills', 'benefits', 'contact', 'applyNote'].map(key => [key, (job[key] || '').split('\n').filter(Boolean)]))
  }));
  const visibleJobsData = [...new Set(openJobs.map(job => job.category))].map(category => ({
    category,
    description: 'Explore opportunities in this team.',
    jobs: openJobs.filter(job => job.category === category)
  }));
  const [selectedJob, setSelectedJob] = useState(null);
  const [filter, setFilter] = useState("All");
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    const isValidCategory = Boolean(category);
    setFilter(isValidCategory ? category : "All");
  }, [location.search]);
  const handleJobClick = job => setSelectedJob(job);
  const handleApplyNow = () => selectedJob && window.open(selectedJob.googleFormLink, "_blank", "noopener,noreferrer");
  const handleBack = () => setSelectedJob(null);
  const handleFilterChange = event => {
    setFilter(event.target.value);
    setSelectedJob(null);
  };
  const filteredJobs = filter === "All" ? visibleJobsData : visibleJobsData.filter(category => category.category === filter);
  const totalOpenings = visibleJobsData.reduce((total, category) => total + category.jobs.length, 0);
  return <main className="bg-neutral-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 border-b border-neutral-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
          <Heading text="Start doing work that matters" color="text-neutral-950" bgColor="bg-red-600" />
            <p className="mt-4 text-base leading-7 text-neutral-600 sm:text-lg">
            Our philosophy is simple — hire a team of diverse, passionate people
            and foster a culture that empowers you to do your best work.
          </p>
            <p className="mt-3 text-sm font-medium text-neutral-500">
              {totalOpenings} open {totalOpenings === 1 ? "position" : "positions"} across {visibleJobsData.length} career areas
            </p>
          </div>

          <div className="w-full lg:w-72">
            <label htmlFor="career-category-filter" className="mb-2 block text-sm font-semibold text-neutral-800">
              Filter by career area
            </label>
          <select id="career-category-filter" value={filter} onChange={handleFilterChange} className="min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-neutral-700 shadow-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20">
              <option value="All">All career areas</option>
              {filter !== "All" && !visibleJobsData.some(group => group.category === filter) && <option value={filter}>{filter}</option>}
              {visibleJobsData.map(category => <option key={category.category} value={category.category}>
                {category.category}
              </option>)}
          </select>
          </div>
        </div>

      <ContentState loading={loading} error={error} retry={retry} empty={!filteredJobs.length} />
      {!loading && !error && (selectedJob ? <JobDetails job={selectedJob} onApply={handleApplyNow} onBack={handleBack} /> : <div className="space-y-8">
            {filteredJobs.map((category, index) => <section key={category.category} aria-labelledby={`career-category-${index}`} className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
                <header className="flex flex-col gap-4 border-b border-neutral-200 bg-neutral-950 px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
                      Career area {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 id={`career-category-${index}`} className="mt-2 text-2xl font-semibold">
                      {category.category}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">
                      {category.description}
                    </p>
                  </div>
                  <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold">
                    <BriefcaseBusiness aria-hidden="true" size={17} />
                    {category.jobs.length} open
                  </span>
                </header>

            {category.jobs.length > 0 ? <div className="grid gap-5 p-5 md:grid-cols-2 sm:p-8">
                    {category.jobs.map(job => <JobCard key={job.id} job={job} onClick={() => handleJobClick(job)} />)}
              </div> : <div className="flex items-center gap-4 px-6 py-8 text-neutral-500 sm:px-8">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                      <SearchX aria-hidden="true" size={20} />
                    </span>
                    <div>
                      <p className="font-medium text-neutral-800">
                        No active positions right now
                      </p>
                      <p className="mt-1 text-sm">
                        Please check back for future opportunities in this career area.
                      </p>
                    </div>
                  </div>}
              </section>)}
          </div>)}
      </div>
    </main>;
};
export default JobsListing;
