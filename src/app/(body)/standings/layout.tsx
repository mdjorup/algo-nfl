import PageHeader from '@/components/PageHeader'
import React from 'react'
import SelectStandings from './SelectStandings'

const StandingsLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {




  return (
    <>
      <PageHeader title="2024 NFL Standings" />
      <SelectStandings />
      {children}
    </>
  )
}

export default StandingsLayout