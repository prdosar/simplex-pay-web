'use client'

import { useEffect } from 'react'
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5080'

interface NewOfferEvent {
  category: 'devises' | 'kilos' | 'bateau'
  offerId: string
}

/** Hook qui ouvre une connexion SignalR au hub /hubs/marketplace et appelle
 *  onNewOffer(category, offerId) à chaque event "NewOffer" reçu. La connexion
 *  est fermée automatiquement au démontage. */
export function useMarketplaceRealtime(onNewOffer: (e: NewOfferEvent) => void) {
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/marketplace`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on('NewOffer', (payload: NewOfferEvent) => {
      onNewOffer(payload)
    })

    connection.start().catch(err => {
      // Silencieux — pas critique si le hub est indisponible.
      // eslint-disable-next-line no-console
      console.warn('[SignalR] connexion échouée:', err?.message ?? err)
    })

    return () => {
      if (connection.state !== HubConnectionState.Disconnected) {
        connection.stop().catch(() => { /* ignore */ })
      }
    }
    // Volontairement pas de dep sur onNewOffer — sinon reconnect à chaque render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
