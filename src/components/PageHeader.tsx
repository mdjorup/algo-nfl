
export interface PageHeaderProps {
  title: string;
  description?: string;
}

const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (

    <div className="mx-auto">
      <h1 className="text-3xl font-bold mb-8">{title}</h1>
      {description && <p className="text-foreground mb-8">{description}</p>}
    </div>
  )
}

export default PageHeader