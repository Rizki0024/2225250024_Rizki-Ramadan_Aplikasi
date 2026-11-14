// Kelas Guru Virtual — diisi penuh pada Fase D.
import { useParams } from 'react-router-dom';
import Page from '../components/Layout.jsx';
import TeacherAvatar from '../features/teacher/TeacherAvatar.jsx';

export function ClassroomList() {
  return (
    <Page title="Belajar Bersama Guru">
      <div className="card center stack">
        <TeacherAvatar size={160} expression="happy" pose="wave" />
        <p>Kelas guru virtual sedang disiapkan.</p>
      </div>
    </Page>
  );
}

export function ClassroomRoute() {
  const { slug } = useParams();
  return <Page title="Kelas" back="/kelas"><p>{slug}</p></Page>;
}
