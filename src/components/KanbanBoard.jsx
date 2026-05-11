import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import api from '../api/axios'

const STATUS_STYLES = {
  applied: 'bg-blue-50 text-blue-600 border-blue-100',
  interview: 'bg-amber-50 text-amber-600 border-amber-100',
  offer: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  rejected: 'bg-red-50 text-red-500 border-red-100',
}

const STATUS_DOT = {
  applied: 'bg-blue-500',
  interview: 'bg-amber-500',
  offer: 'bg-emerald-500',
  rejected: 'bg-red-500',
}

const COLUMNS = [
  { id: 'applied', title: 'Applied', color: 'text-blue-600' },
  { id: 'interview', title: 'Interview', color: 'text-amber-600' },
  { id: 'offer', title: 'Offer', color: 'text-emerald-600' },
  { id: 'rejected', title: 'Rejected', color: 'text-red-500' },
]

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const getFollowUpStatus = (date) => {
  if (!date) return null
  const diffDays = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) {
    return { label: 'Overdue', badge: 'bg-red-50 text-red-600' }
  }
  if (diffDays <= 3) {
    return { label: 'Due soon', badge: 'bg-amber-50 text-amber-600' }
  }
  return { label: '', badge: 'bg-gray-100 text-gray-700' }
}

export default function KanbanBoard({ jobs, onJobUpdate }) {
  const [draggingJobId, setDraggingJobId] = useState(null)
  const [error, setError] = useState('')

  const handleDragStart = (start) => {
    setDraggingJobId(start.draggableId)
    setError('')
  }

  const handleDragEnd = async (result) => {
    setDraggingJobId(null)

    if (!result.destination) return

    const { draggableId, source, destination } = result

    if (source.droppableId === destination.droppableId) return

    const job = jobs.find(j => j._id === draggableId)
    if (!job) return

    const newStatus = destination.droppableId

    try {
      await api.put(`/jobs/${job._id}`, { ...job, status: newStatus })
      onJobUpdate(job._id, newStatus)
    } catch {
      setError('Failed to update job status')
      // The job will snap back to original position due to optimistic updates
    }
  }

  const getJobsByStatus = (status) => {
    return jobs.filter(job => job.status === status)
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLUMNS.map(column => {
            const columnJobs = getJobsByStatus(column.id)

            return (
              <div key={column.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                  <h3 className={`font-semibold text-sm uppercase tracking-widest ${column.color}`}>
                    {column.title}
                  </h3>
                  <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                    {columnJobs.length}
                  </span>
                </div>

                {/* Column Content */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl' : ''
                      }`}
                    >
                      {columnJobs.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                          No jobs here
                        </div>
                      ) : (
                        columnJobs.map((job, index) => (
                          <Draggable
                            key={job._id}
                            draggableId={job._id}
                            index={index}
                            isDragDisabled={draggingJobId === job._id}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-all cursor-pointer ${
                                  snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                } ${draggingJobId === job._id ? 'opacity-50' : ''}`}
                              >
                                <Link to={`/jobs/${job._id}`} className="block">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                                        {job.position}
                                      </h4>
                                      <p className="text-gray-500 text-xs truncate">
                                        {job.company}
                                      </p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${STATUS_DOT[job.status]} shrink-0 ml-2`} />
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-xs">
                                      {formatDate(job.createdAt)}
                                    </span>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg capitalize ${STATUS_STYLES[job.status]}`}>
                                      {job.status}
                                    </span>
                                  </div>
                                  {job.followUpDate && (() => {
                                    const followUp = getFollowUpStatus(job.followUpDate)
                                    return (
                                      <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-2 py-1 text-[11px] font-semibold ${followUp.badge}`}>
                                        <span>{formatDate(job.followUpDate)}</span>
                                        {followUp.label && <span className="uppercase tracking-widest">{followUp.label}</span>}
                                      </div>
                                    )
                                  })()}
                                </Link>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </>
  )
}