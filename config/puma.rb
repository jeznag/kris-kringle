workers Integer(ENV['WEB_CONCURRENCY'] || 1)
threads_count = Integer(ENV['RAILS_MAX_THREADS'] || 5)
threads threads_count, threads_count

preload_app!

port        ENV['PORT']     || 3000
environment ENV['RAILS_ENV'] || 'development'

pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }

on_worker_boot do
  # Worker-specific setup for Rails 4.1+
  ActiveRecord::Base.establish_connection if defined?(ActiveRecord)
end
