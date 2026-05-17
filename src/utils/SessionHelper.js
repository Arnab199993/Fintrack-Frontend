class SessionHelper {
  static GetCustomer() {
    if (typeof window === 'undefined') return null
    return window.localStorage?.getItem('authToken') || null
  }

  static SetCustomer(token) {
    if (typeof window !== 'undefined') {
      if (token) {
        window.localStorage?.setItem('authToken', token)
      } else {
        window.localStorage?.removeItem('authToken')
      }
    }
  }

  static setUserDetails(user) {
    if (typeof window !== 'undefined') {
      if (user) {
        window.localStorage?.setItem('userDetails', JSON.stringify(user))
      } else {
        window.localStorage?.removeItem('userDetails')
      }
    }
  }

  static GetCustomerDetails() {
    if (typeof window === 'undefined') return null
    try {
      return JSON.parse(window.localStorage?.getItem('userDetails')) || null
    } catch {
      return null
    }
  }

  static ClearSession() {
    if (typeof window !== 'undefined') {
      window.localStorage?.removeItem('authToken')
      window.localStorage?.removeItem('userDetails')
    }
  }

  static IsAuthenticated() {
    return !!this.GetCustomer()
  }
}

export default SessionHelper
