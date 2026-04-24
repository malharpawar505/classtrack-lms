import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PageHeader } from '../components/layout/PageHeader';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Spinner } from '../components/ui/Spinner';
import { AttendanceGrid } from '../components/shared/AttendanceGrid';

export const StudentAttendance = ({ profile }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('attendance').select('*').eq('student_id', profile.id).order('date', { ascending: false });
      setAttendance(data || []); setLoading(false);
    })();
  }, [profile.id]);
  
  return (
    <PageWrapper>
      <PageHeader title="My Attendance" subtitle="Monthly view" />
      <div className="p-8">
        {loading ? <Spinner /> : <AttendanceGrid attendance={attendance} />}
      </div>
    </PageWrapper>
  );
};
