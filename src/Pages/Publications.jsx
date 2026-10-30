import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../Components/Publications/Hero';
import CommunicationDevelopment from '../Components/Publications/CommunicationDevelopment';
import ArticleSection1 from '../Components/Publications/ArticleSection1';
import FeaturedPublicationBanner2 from '../Components/Publications/FeaturedPublicationBanner2';
import SocialImpact from '../Components/Publications/SocialImpact';
import FeaturedPublicationBanner from '../Components/Publications/FeaturedPublicationBanner';
import CapacityDevelopment from '../Components/Publications/CapacityDevelopment';
import PodcastBanner from '../Components/Publications/PodcastBanner';
import PodcastsSection from '../Components/Publications/PadcastsSection';
import FactSheetsSection from '../Components/Publications/FactSheetsSection';
import { useContent } from '../features/content/useContent';
import ContentState from '../features/content/ContentState';
import ContentDialog from '../features/content/ContentDialog';
import { displayDate, safeLink } from '../features/content/model';
import { imageUrl } from '../features/team/model';
import '../features/team/team.css';
import '../features/content/content.css';

function youtubeId(link=''){
  try { const url=new URL(link);const id=url.hostname==='youtu.be'?url.pathname.slice(1):['youtube.com','www.youtube.com'].includes(url.hostname)?url.searchParams.get('v'):'';return /^[\w-]{11}$/.test(id||'')?id:''; }catch{return '';}
}
export default function Publications(){
  const {records,loading,error,retry}=useContent('impact');
  const [article,setArticle]=useState(null);
  const [collection,setCollection]=useState(null);
  const navigate=useNavigate();
  const items=records.map(record=>({...record,imageUrl:imageUrl(record.image),cover:imageUrl(record.image),exploreUrl:record.link,date:displayDate(record.date),comingSoon:record.availability==='coming-soon',youtubeId:youtubeId(record.link)}));
  const group=category=>items.filter(item=>item.category===category);
  const open=item=>{
    setCollection(null);
    if(item.availability!=='coming-soon'&&!item.body&&item.link&&safeLink(item.link)){
      if(item.link.startsWith('/'))navigate(item.link);else window.open(item.link,'_blank','noopener,noreferrer');
    }else setArticle(item);
  };
  const browse=(title,items)=>()=>setCollection({title,items});
  const dashboards=group('Dashboards & Data Analytics');
  const insights=group('Insights');
  const reports=group('Impact Reports');
  const publications=group('Publications');
  const media=items.filter(item=>['Videos','Podcasts'].includes(item.category));
  const facts=group('Fact Sheets');
  return <div className="impact-page"><Hero/>
    <div id="impact-library"><ContentState loading={loading} error={error} retry={retry} empty={!records.length}/>
    {!loading&&!error&&records.length>0&&<>
      <CommunicationDevelopment dashboards={dashboards} onOpen={open} onBrowse={browse('Dashboards & Data Analytics',dashboards)}/>
      <ArticleSection1 articles={insights} onOpen={open}/>
      <FeaturedPublicationBanner2 onOpen={browse('Impact assessment reports',reports)}/>
      <div id="impact-reports"><SocialImpact reports={reports} onOpen={open} onBrowse={browse('Research & Reports',reports)}/></div>
      <FeaturedPublicationBanner/>
      <CapacityDevelopment toolkitItems={publications} onOpen={open} onBrowse={browse('Publications & Resources',publications)}/>
      <PodcastBanner/>
      <PodcastsSection videos={media} onOpen={open} onBrowse={browse('Videos & Podcasts',media)}/>
      <FactSheetsSection factSheetItems={facts} onOpen={open} onBrowse={browse('Fact Sheets',facts)}/>
    </>}
    </div>
    {article&&<ContentDialog title={article.title} onClose={()=>setArticle(null)}><div className="impact-article">{article.date&&<p>{article.date}</p>}{(article.body||article.description||'').split(/\n\s*\n/).filter(Boolean).map((paragraph,i)=><p key={i}>{paragraph}</p>)}{article.availability==='coming-soon'&&<p>This resource is coming soon.</p>}{article.availability!=='coming-soon'&&article.link&&safeLink(article.link)&&<a className="ta-button" href={article.link} target="_blank" rel="noopener noreferrer">Open related resource</a>}</div></ContentDialog>}
    {collection&&<ContentDialog title={collection.title} onClose={()=>setCollection(null)}><div className="impact-article">{collection.items.length?collection.items.map(item=><button key={item.id} className="block w-full border-b py-4 text-left" onClick={()=>open(item)}>{item.title}{item.comingSoon&&<small className="block">Coming soon</small>}</button>):<p>New resources will appear here when published.</p>}</div></ContentDialog>}
  </div>;
}
