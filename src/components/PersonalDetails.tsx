import type { Profile } from "../profile";
import Icon from "./Icon";
import { Avatar, DetailItem, PageHeading } from "./ProfileUi";

export default function PersonalDetails({ profile, onEdit }: { profile: Profile; onEdit: () => void }) {
  return (
    <>
      <PageHeading eyebrow="GET TO KNOW YOU" title="Personal details" description="The essentials that help people put a name to your work." action={<button className="button button-primary" onClick={onEdit}><Icon name="edit" size={16} /> Edit details</button>} />
      <section className="detail-card">
        <div className="detail-profile"><Avatar name={profile.name} /><div><h2>{profile.name}</h2><p>{profile.title}</p></div><span className="profile-status"><span className="live-dot" /> Profile active</span></div>
        <div className="detail-divider" />
        <div className="detail-grid">
          <DetailItem label="EMAIL ADDRESS" value={profile.email} />
          <DetailItem label="LOCATION" value={profile.location || "Add your location"} />
          <DetailItem label="WEBSITE" value={profile.website || "Add your website"} />
        </div>
        <div className="about-block"><span className="eyebrow">ABOUT</span><p>{profile.summary || "Tell people a little about yourself and the work you love."}</p></div>
      </section>
    </>
  );
}
