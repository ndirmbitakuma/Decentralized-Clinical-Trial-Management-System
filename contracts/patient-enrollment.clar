;; Patient Enrollment Contract

(define-map patients
  { patient-id: principal }
  { enrolled: bool, consent-given: bool }
)

(define-map trials
  { trial-id: uint }
  { name: (string-ascii 64), max-participants: uint, current-participants: uint }
)

(define-data-var trial-id-nonce uint u0)

(define-public (create-trial (name (string-ascii 64)) (max-participants uint))
  (let ((new-trial-id (+ (var-get trial-id-nonce) u1)))
    (map-set trials
      { trial-id: new-trial-id }
      { name: name, max-participants: max-participants, current-participants: u0 }
    )
    (var-set trial-id-nonce new-trial-id)
    (ok new-trial-id)
  )
)

(define-public (enroll-patient (trial-id uint))
  (let ((trial (unwrap! (map-get? trials { trial-id: trial-id }) (err u404))))
    (asserts! (< (get current-participants trial) (get max-participants trial)) (err u403))
    (map-set patients
      { patient-id: tx-sender }
      { enrolled: true, consent-given: false }
    )
    (map-set trials
      { trial-id: trial-id }
      (merge trial { current-participants: (+ (get current-participants trial) u1) })
    )
    (ok true)
  )
)

(define-public (give-consent (trial-id uint))
  (let ((patient (unwrap! (map-get? patients { patient-id: tx-sender }) (err u404))))
    (asserts! (get enrolled patient) (err u403))
    (ok (map-set patients
      { patient-id: tx-sender }
      (merge patient { consent-given: true })
    ))
  )
)

(define-read-only (get-patient-data (patient-id principal))
  (map-get? patients { patient-id: patient-id })
)

(define-read-only (get-trial-data (trial-id uint))
  (map-get? trials { trial-id: trial-id })
)

