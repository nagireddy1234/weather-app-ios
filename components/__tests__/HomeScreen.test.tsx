import React from 'react'
import { render, waitFor } from '@testing-library/react-native'
import HomeScreen from '../../app/(tabs)'
import { CityProvider } from '@/context/CityContext'

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((cb) => {
    cb({ isConnected: true })
    return () => {}
  }),
}))

describe('HomeScreen', () => {
  it('renders loading indicator initially', () => {
    const { getByTestId } = render(
      <CityProvider>
        <HomeScreen />
      </CityProvider>
    )
    expect(getByTestId('loading-indicator')).toBeTruthy()
  })

  it('renders weather info after loading', async () => {
    const { getByText, queryByTestId } = render(
      <CityProvider>
        <HomeScreen />
      </CityProvider>
    )

    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull()
      expect(getByText('New York')).toBeTruthy()
      expect(getByText(/Feels Like:/)).toBeTruthy()
      expect(getByText(/Hourly Forecast/)).toBeTruthy()
    })
  })

  it('shows error and retry button if no internet', async () => {
    const netInfo = require('@react-native-community/netinfo')
    netInfo.addEventListener.mockImplementationOnce(
      (cb: (state: { isConnected: boolean }) => void) => {
        cb({ isConnected: false })
        return () => {}
      }
    )

    const { getByText } = render(
      <CityProvider>
        <HomeScreen />
      </CityProvider>
    )

    await waitFor(() => {
      expect(getByText(/No internet connection/i)).toBeTruthy()
      expect(getByText(/Retry/i)).toBeTruthy()
    })
  })
})
