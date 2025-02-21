import { describe, it, beforeEach, expect } from "vitest"

describe("Patient Enrollment Contract", () => {
  let mockStorage: Map<string, any>
  let trialIdNonce: number
  
  beforeEach(() => {
    mockStorage = new Map()
    trialIdNonce = 0
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "create-trial":
        const [name, maxParticipants] = args
        trialIdNonce++
        mockStorage.set(`trial-${trialIdNonce}`, {
          name,
          "max-participants": maxParticipants,
          "current-participants": 0,
        })
        return { success: true, value: trialIdNonce }
      
      case "enroll-patient":
        const [trialId] = args
        const trial = mockStorage.get(`trial-${trialId}`)
        if (!trial) return { success: false, error: 404 }
        if (trial["current-participants"] >= trial["max-participants"]) {
          return { success: false, error: 403 }
        }
        mockStorage.set(`patient-${sender}`, { enrolled: true, "consent-given": false })
        trial["current-participants"]++
        return { success: true }
      
      case "give-consent":
        const patient = mockStorage.get(`patient-${sender}`)
        if (!patient || !patient.enrolled) return { success: false, error: 403 }
        patient["consent-given"] = true
        return { success: true }
      
      case "get-patient-data":
        return { success: true, value: mockStorage.get(`patient-${args[0]}`) }
      
      case "get-trial-data":
        return { success: true, value: mockStorage.get(`trial-${args[0]}`) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should create a trial", () => {
    const result = mockContractCall("create-trial", ["Test Trial", 100], "owner")
    expect(result.success).toBe(true)
    expect(result.value).toBe(1)
  })
  
  it("should enroll a patient", () => {
    mockContractCall("create-trial", ["Test Trial", 100], "owner")
    const result = mockContractCall("enroll-patient", [1], "patient1")
    expect(result.success).toBe(true)
  })
  
  it("should give consent", () => {
    mockContractCall("create-trial", ["Test Trial", 100], "owner")
    mockContractCall("enroll-patient", [1], "patient1")
    const result = mockContractCall("give-consent", [1], "patient1")
    expect(result.success).toBe(true)
  })
  
  it("should get patient data", () => {
    mockContractCall("create-trial", ["Test Trial", 100], "owner")
    mockContractCall("enroll-patient", [1], "patient1")
    mockContractCall("give-consent", [1], "patient1")
    const result = mockContractCall("get-patient-data", ["patient1"], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({ enrolled: true, "consent-given": true })
  })
  
  it("should get trial data", () => {
    mockContractCall("create-trial", ["Test Trial", 100], "owner")
    const result = mockContractCall("get-trial-data", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      name: "Test Trial",
      "max-participants": 100,
      "current-participants": 0,
    })
  })
})

