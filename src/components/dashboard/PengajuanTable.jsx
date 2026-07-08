import { Fragment } from 'react'

export default function PengajuanTable({
  rows = [],
  openRow,
  finalDate,
  setFinalDate,
  finalTime,
  setFinalTime,
  openApprovePanel,
  updateStatus,
  confirmApprove,
  isSupabaseConfigured,
}) {
  return (
    <div className="card">
      <h3 className="text-[15px] mb-3.5 text-navy-950">Pengajuan Terbaru</h3>

      <table className="w-full border-collapse text-[13.5px]">
        <thead>
          <tr className="text-left text-[#5b6472] text-xs uppercase tracking-wide">
            <th>No.</th>
            <th>Instansi</th>
            <th>Materi</th>
            <th>Tanggal</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-4">
                Tidak ada pengajuan
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <Fragment key={r.id}>
                <tr>
                  <td>#{r.nomor_urut}</td>

                  <td>{r.instansi}</td>

                  <td>{r.materi}</td>

                  <td>{r.created_at || '-'}</td>

                  <td>
                    <span className={`badge b-${r.status}`}>{r.status}</span>
                  </td>

                  <td>
                    {isSupabaseConfigured &&
                    ['pending', 'diproses', 'revisi'].includes(r.status) ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openApprovePanel(r)}
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStatus(r, 'revisi')}
                        >
                          Revisi
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStatus(r, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>

                {openRow === r.id && (
                  <tr key={`${r.id}-details`}>
                    <td colSpan={6}>
                      <input
                        type="date"
                        value={finalDate}
                        onChange={(e) => setFinalDate(e.target.value)}
                      />

                      <input
                        type="time"
                        value={finalTime}
                        onChange={(e) => setFinalTime(e.target.value)}
                      />

                      <button type="button" onClick={() => confirmApprove(r)}>
                        Konfirmasi
                      </button>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
