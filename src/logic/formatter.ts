import moment from "moment";

export function durationFmt(duration: number): string
{
  return moment.utc(moment.duration(duration, "seconds").asMilliseconds()).format("mm:ss")
}

export function sizeFmt(size: number): string
{
  for (const unit of ["B", "KiB", "MiB", "GiB", "TiB", "PiB"])
  {
    if (Math.abs(size) < 1024.0)
    {
      return `${size.toFixed(1)} ${unit}`
    }
    size /= 1024.0
  }
  return "> 1024 PiB"
}
