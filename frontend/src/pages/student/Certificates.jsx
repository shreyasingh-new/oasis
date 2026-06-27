import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Download, Loader, Calendar, Compass } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/student/certificates');
      setCertificates(response.data.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">My Certificates</h1>
        <p className="text-gray-400 text-sm mt-1">Download and print verified certificates of participation from your completed events.</p>
      </div>

      {certificates.length === 0 ? (
        <div className="glass p-16 rounded-3xl text-center text-gray-500 space-y-4 max-w-xl mx-auto">
          <Award size={48} className="text-gray-600 mx-auto" />
          <h3 className="text-md font-bold text-white">No Certificates Available</h3>
          <p className="text-xs leading-relaxed max-w-sm mx-auto">
            Certificates are issued after you attend events. Make sure organizers mark your attendance as "Present" and upload certificates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => {
            const ev = cert.event;
            if (!ev) return null;

            return (
              <div key={cert._id} className="glass p-6 rounded-3xl flex flex-col justify-between h-[220px] relative overflow-hidden">
                {/* Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Award size={20} />
                  </div>

                  <div>
                    <h3 className="text-md font-bold text-white leading-snug line-clamp-1">{ev.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 font-semibold">
                      <Calendar size={12} />
                      <span>{new Date(ev.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800/40">
                  <a
                    href={cert.certificateURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl font-bold bg-gray-900 border border-gray-800 hover:bg-gray-800 text-emerald-400 flex items-center justify-center gap-2 text-xs transition-all"
                  >
                    <Download size={14} />
                    Download Certificate
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Certificates;
