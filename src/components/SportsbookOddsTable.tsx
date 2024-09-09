'use client'

import { convertDecimalToAmerican } from '@/lib/oddsUtils'
import { EventOdds } from '@/lib/types'
import { format } from 'date-fns'
import Image from 'next/image'
import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

interface SportsbookOddsTableProps {
  homeTeam: string;
  awayTeam: string;
  data: EventOdds[];
}

type OddsStyle = 'decimal' | 'american'

const SportsbookOddsTable = ({ awayTeam, homeTeam, data }: SportsbookOddsTableProps) => {

  const [oddsStyle, setOddsStyle] = React.useState<OddsStyle>('american')


  return (
    <div>
      <Table>
        <TableCaption>Odds might be delayed by up to 4 hours</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Sportsbook</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead><Image src={`/${awayTeam}.png`} alt={awayTeam} width={30} height={30} /></TableHead>
            <TableHead><Image src={`/${homeTeam}.png`} alt={awayTeam} width={30} height={30} /></TableHead>

          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((odds, i) => (
            <TableRow key={i}>
              <TableCell>{odds.sportsbook_key}</TableCell>
              <TableCell>{format(odds.timestamp, "MM/dd p")}</TableCell>
              <TableCell>{oddsStyle === 'decimal' ? odds.away_odds.toFixed(2) : convertDecimalToAmerican(odds.away_odds)}</TableCell>
              <TableCell>{oddsStyle === 'decimal' ? odds.home_odds.toFixed(2) : convertDecimalToAmerican(odds.home_odds)}</TableCell>
            </TableRow>
          ))}
        </TableBody>


      </Table>
    </div>
  )
}

export default SportsbookOddsTable