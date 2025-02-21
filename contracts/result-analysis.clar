;; Result Analysis Contract

(define-map trial-results
  { trial-id: uint }
  { summary: (string-utf8 1024), conclusion: (string-utf8 1024), published: bool }
)

(define-map patient-results
  { trial-id: uint, patient-id: principal }
  { data: (list 100 { data-type: (string-ascii 64), value: (string-utf8 256) }) }
)

(define-public (submit-patient-results (trial-id uint) (data (list 100 { data-type: (string-ascii 64), value: (string-utf8 256) })))
  (ok (map-set patient-results
    { trial-id: trial-id, patient-id: tx-sender }
    { data: data }
  ))
)

(define-public (publish-trial-results (trial-id uint) (summary (string-utf8 1024)) (conclusion (string-utf8 1024)))
  (ok (map-set trial-results
    { trial-id: trial-id }
    { summary: summary, conclusion: conclusion, published: true }
  ))
)

(define-read-only (get-patient-results (trial-id uint) (patient-id principal))
  (map-get? patient-results { trial-id: trial-id, patient-id: patient-id })
)

(define-read-only (get-trial-results (trial-id uint))
  (map-get? trial-results { trial-id: trial-id })
)

